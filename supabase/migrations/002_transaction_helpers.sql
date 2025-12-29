-- Transaction helper functions for atomic operations

-- Update account balance atomically
CREATE OR REPLACE FUNCTION public.update_account_balance(
  p_account_id UUID,
  p_new_balance DECIMAL(20,6)
) RETURNS VOID AS $$
BEGIN
  UPDATE public.accounts
  SET balance = p_new_balance,
      updated_at = NOW()
  WHERE id = p_account_id;
END;
$$ LANGUAGE plpgsql;

-- Transfer funds between accounts atomically
CREATE OR REPLACE FUNCTION public.transfer_funds(
  p_from_account_id UUID,
  p_to_account_id UUID,
  p_amount DECIMAL(20,6)
) RETURNS VOID AS $$
DECLARE
  v_from_balance DECIMAL(20,6);
  v_to_balance DECIMAL(20,6);
BEGIN
  SELECT balance INTO v_from_balance
  FROM public.accounts
  WHERE id = p_from_account_id
  FOR UPDATE;
  
  IF v_from_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance in source account';
  END IF;
  
  SELECT balance INTO v_to_balance
  FROM public.accounts
  WHERE id = p_to_account_id
  FOR UPDATE;
  
  UPDATE public.accounts
  SET balance = v_from_balance - p_amount,
      updated_at = NOW()
  WHERE id = p_from_account_id;
  
  UPDATE public.accounts
  SET balance = v_to_balance + p_amount,
      updated_at = NOW()
  WHERE id = p_to_account_id;
END;
$$ LANGUAGE plpgsql;

-- Add funds to account atomically
CREATE OR REPLACE FUNCTION public.add_account_funds(
  p_account_id UUID,
  p_amount DECIMAL(20,6)
) RETURNS VOID AS $$
BEGIN
  UPDATE public.accounts
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE id = p_account_id;
END;
$$ LANGUAGE plpgsql;

-- Deduct funds from account atomically
CREATE OR REPLACE FUNCTION public.deduct_account_funds(
  p_account_id UUID,
  p_amount DECIMAL(20,6)
) RETURNS VOID AS $$
DECLARE
  v_balance DECIMAL(20,6);
BEGIN
  SELECT balance INTO v_balance
  FROM public.accounts
  WHERE id = p_account_id
  FOR UPDATE;
  
  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  UPDATE public.accounts
  SET balance = v_balance - p_amount,
      updated_at = NOW()
  WHERE id = p_account_id;
END;
$$ LANGUAGE plpgsql;
